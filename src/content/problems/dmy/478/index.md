---
oj: dmy
pid: '478'
title: '[R77D] 归并'
difficulty: 提高
tags:
  - 数据结构
  - 堆
  - 链表
timeLimit: 1.5s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$0 \le a_i \le 10^9$。

## 思路

暴力做法是每一轮线性扫描所有未移走的盒子，找出物料量最小且编号最小者，再向右扫描它的后继，共 $O(n^2)$，只能通过 $n \le 2000$ 的子任务。

每一轮需要完成两件事：

1. 在所有未移走的盒子中取出「物料量最小、原编号最小」者；
2. 求出某个盒子右侧最近的未移走盒子。

第 2 件事用链表维护：按原编号建立双向链表，记 $nxt_i$、$prv_i$ 分别为 $i$ 当前的后继与前驱。删掉 $i$ 时把它的后继直接接到前驱后面，即 $nxt_{prv_i} \leftarrow nxt_i$、$prv_{nxt_i} \leftarrow prv_i$。这样任意时刻 $nxt_i$ 就是 $i$ 右侧最近的未移走盒子；若 $nxt_i$ 为空，说明 $i$ 已经是最右侧的盒子，这 $v$ 单位物料直接丢弃。

第 1 件事用小根堆维护二元组 $(a_i, i)$，按字典序比较，堆顶即为本轮要移走的盒子。

麻烦之处在于盒子的物料量会被修改。注意到物料量只会增加，所以修改时不必真的去堆里改键，直接推入一条新记录 $(a_j, j)$，旧记录留作废记录。取出堆顶时校验：若记录的物料量与盒子当前的物料量不一致，或盒子已被移走，说明是废记录，丢弃并继续取堆顶。由于每个未移走盒子当前值都有一条对应记录在堆中，而堆顶又是堆中最小值，所以第一个通过校验的堆顶一定是全局最小。

一个容易漏掉的细节：当移走的盒子物料量 $v = 0$ 时，后继的物料量不变，会向堆中推入一条与已有记录完全相同的记录。此时仅靠「物料量是否一致」无法识别它，必须在校验时同时判断盒子是否仍然存活，否则已经移走的盒子会被再次选中。

## 复杂度

每轮至多推入一条新记录，因此总共至多推入 $2n$ 条记录，堆操作总代价为 $O(n \log n)$；链表删除与查询都是 $O(1)$。时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

var hval = Array<Int64>(1, { _ => 0 })
var hidx = Array<Int64>(1, { _ => 0 })
var hsize: Int64 = 0

func heapLess(p: Int64, q: Int64): Bool {
    if (hval[p] != hval[q]) {
        return hval[p] < hval[q]
    }
    return hidx[p] < hidx[q]
}

func heapPush(v: Int64, i: Int64) {
    hsize += 1
    hval[hsize] = v
    hidx[hsize] = i
    var p = hsize
    while (p > 1) {
        let q = p / 2
        if (!heapLess(p, q)) {
            break
        }
        let tv = hval[p]
        hval[p] = hval[q]
        hval[q] = tv
        let ti = hidx[p]
        hidx[p] = hidx[q]
        hidx[q] = ti
        p = q
    }
}

func heapPop() {
    hval[1] = hval[hsize]
    hidx[1] = hidx[hsize]
    hsize -= 1
    var p: Int64 = 1
    while (true) {
        var c = 2 * p
        if (c > hsize) {
            break
        }
        if (c + 1 <= hsize && heapLess(c + 1, c)) {
            c += 1
        }
        if (!heapLess(c, p)) {
            break
        }
        let tv = hval[p]
        hval[p] = hval[c]
        hval[c] = tv
        let ti = hidx[p]
        hidx[p] = hidx[c]
        hidx[c] = ti
        p = c
    }
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let nn = n
    hval = Array<Int64>(2 * nn + 5, { _ => 0 })
    hidx = Array<Int64>(2 * nn + 5, { _ => 0 })

    let val = Array<Int64>(nn + 2, { _ => 0 })
    let nxt = Array<Int64>(nn + 2, { _ => 0 })
    let prv = Array<Int64>(nn + 2, { _ => 0 })
    let alive = Array<Bool>(nn + 2, { _ => true })

    for (i in 0..nn) {
        let id = i + 1
        val[id] = a[i]
        nxt[id] = id + 1
        prv[id] = id - 1
        heapPush(a[i], id)
    }
    nxt[nn] = 0

    var done: Int64 = 0
    while (done < nn) {
        var v = hval[1]
        var i = hidx[1]
        while ((!alive[i]) || val[i] != v) {
            heapPop()
            v = hval[1]
            i = hidx[1]
        }
        heapPop()
        alive[i] = false
        let j = nxt[i]
        if (j != 0) {
            val[j] += v
            heapPush(val[j], j)
            prv[j] = prv[i]
        }
        if (prv[i] != 0) {
            nxt[prv[i]] = j
        }
        if (done > 0) {
            print(" ")
        }
        print(i)
        done += 1
    }
    println()
}
```

</details>
