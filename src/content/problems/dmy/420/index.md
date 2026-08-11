---
oj: dmy
pid: '420'
title: '[R67F] 活动2'
difficulty: 提高
tags:
  - 线段树
  - BFS
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 10^6$。

## 思路

对每个人 $i$，条件「编号在 $[l_i, r_i]$ 内的人都参加了活动」的逆否命题是：只要 $[l_i, r_i]$ 内存在一个不参加的人，$i$ 就不能参加。因此 1 号不参加会引发连锁反应：区间覆盖到 1 号的人不能参加，区间覆盖到这些人的又不能参加，依此类推。答案是 $n$ 减去「必须不参加」的人数。

用 BFS 模拟传播：设 $x$ 是一个不能参加的人，那么所有满足 $l_i \le x \le r_i$ 的人 $i$ 都不能参加，且每人只需处理一次。

关键是要快速找出所有覆盖点 $x$ 的未删区间。把所有区间按左端点分桶：对每个左端点 $L$，桶内区间按右端点降序存放，指针指向当前最大右端点。再建一棵线段树，第 $L$ 个位置维护左端点为 $L$ 的未删区间中的最大右端点。处理坏点 $x$ 时：

1. 查询前缀 $[1, x]$ 的最大右端点；
2. 若最大值 $< x$，说明不存在覆盖 $x$ 的区间，结束；
3. 否则该区间覆盖 $x$，对应的人不能参加：从桶中删除它（连同同桶中右端点 $\ge x$ 的区间一起删），更新线段树，回到第 1 步。

由于左端点分桶后桶内右端点递减，每次查询返回的位置就是「覆盖 $x$ 且右端点最大」的区间所在桶，其桶顶必然满足 $l \le x \le r$，删除是安全的。

复杂度：每个区间至多被删除一次，每次查询与更新都是 $O(\log n)$，总时间 $O(n \log n)$，空间 $O(n)$。本题 $n$ 达 $10^6$，排序用值域为 $n$ 的两遍计数排序完成（先按 $r$ 降序、再按 $l$ 升序稳定排序），线段树值用 `Int32` 存储以省内存。

## 仓颉实现

```cangjie
import std.env.*

var data: Array<UInt8> = Array<UInt8>(0, { _ => 0 })
var dataLen: Int64 = 0
var pos: Int64 = 0

// 分块读入 stdin 全部字节，再手写整数解析（大输入下比逐行 split 快）
func readAll(reader: ConsoleReader): Unit {
    let cap: Int64 = 20000000
    data = Array<UInt8>(cap, { _ => 0 })
    var total: Int64 = 0
    let chunk = Array<UInt8>(1 << 20, { _ => 0 })
    while (true) {
        let got = reader.read(chunk)
        if (got <= 0) {
            break
        }
        chunk.copyTo(data, 0, total, got)
        total += got
        if (total >= cap) {
            break
        }
    }
    dataLen = total
}

func nextInt(): Int64 {
    var x: Int64 = 0
    while (pos < dataLen && Int64(data[pos]) <= 32) {
        pos += 1
    }
    while (pos < dataLen && Int64(data[pos]) > 32) {
        x = x * 10 + (Int64(data[pos]) - 48)
        pos += 1
    }
    return x
}

// 区间按 (l 升序, r 降序) 排序；ord 为排序后的区间下标（编号 = 下标 + 2）
var n: Int64 = 0
var m: Int64 = 0
var ls: Array<Int32> = Array<Int32>(0, { _ => 0 })
var rs: Array<Int32> = Array<Int32>(0, { _ => 0 })
var ord: Array<Int32> = Array<Int32>(0, { _ => 0 })

// 线段树：位置 L 维护左端点为 L 的未删区间中的最大右端点
var S: Int64 = 0
var segVal: Array<Int32> = Array<Int32>(0, { _ => 0 })
var segPos: Array<Int32> = Array<Int32>(0, { _ => 0 })

// 查询前缀 [1, x] 的最大右端点，返回（最大值，位置）
func queryMax(x: Int64): (Int32, Int64) {
    let qr = x - 1
    if (qr == S - 1) {
        return (segVal[1], Int64(segPos[1]))
    }
    // 自底向上分解 [0, qr]，左兄弟逐步入集
    var i = S + qr + 1
    var bv: Int32 = 0
    var bp: Int64 = 1
    while (i > 1) {
        if ((i & 1) == 1) {
            let j = i - 1
            if (segVal[j] > bv) {
                bv = segVal[j]
                bp = Int64(segPos[j])
            }
        }
        i >>= 1
    }
    return (bv, bp)
}

// 将位置 L 的值更新为 v（值只会减小，父节点不变即可提前退出）
func updatePos(L: Int64, v: Int32) {
    var i = S + L - 1
    segVal[i] = v
    i >>= 1
    while (i >= 1) {
        let lc = i << 1
        let rc = lc | 1
        var nv = segVal[lc]
        var np = segPos[lc]
        if (segVal[rc] > nv) {
            nv = segVal[rc]
            np = segPos[rc]
        }
        if (segVal[i] == nv && segPos[i] == np) {
            break
        }
        segVal[i] = nv
        segPos[i] = np
        i >>= 1
    }
}

main(): Int64 {
    readAll(getStdIn())

    n = nextInt()
    m = n - 1
    let nn = n

    ls = Array<Int32>(m, { _ => 0 })
    rs = Array<Int32>(m, { _ => 0 })
    var i: Int64 = 0
    while (i < m) {
        ls[i] = Int32(nextInt())
        rs[i] = Int32(nextInt())
        i += 1
    }

    // 计数排序两遍：先按 r 降序稳定排序，再按 l 升序稳定排序（桶内保持 r 降序）
    let cnt = Array<Int32>(nn + 2, { _ => 0 })
    let pos2 = Array<Int32>(nn + 2, { _ => 0 })
    var order = Array<Int32>(m, { _ => 0 })
    i = 0
    while (i < m) {
        cnt[Int64(rs[i])] += 1
        i += 1
    }
    var acc: Int32 = 0
    var v: Int64 = nn
    while (v >= 1) {
        pos2[v] = acc
        acc += cnt[v]
        v -= 1
    }
    i = 0
    while (i < m) {
        let rv = Int64(rs[i])
        order[Int64(pos2[rv])] = Int32(i)
        pos2[rv] += 1
        i += 1
    }

    ord = Array<Int32>(m, { _ => 0 })
    i = 0
    while (i <= nn) {
        cnt[i] = 0
        i += 1
    }
    i = 0
    while (i < m) {
        cnt[Int64(ls[Int64(order[i])])] += 1
        i += 1
    }
    acc = 0
    v = 1
    while (v <= nn) {
        pos2[v] = acc
        acc += cnt[v]
        v += 1
    }
    i = 0
    while (i < m) {
        let lv = Int64(ls[Int64(order[i])])
        ord[Int64(pos2[lv])] = order[i]
        pos2[lv] += 1
        i += 1
    }

    // 每个左端点 L 的桶指针（桶内 r 降序，指针指向桶顶）
    var ptr = Array<Int32>(nn + 1, { _ => -1 })
    i = 0
    while (i < m) {
        let L = Int64(ls[Int64(ord[i])])
        ptr[L] = Int32(i)
        i += 1
        while (i < m && Int64(ls[Int64(ord[i])]) == L) {
            i += 1
        }
    }

    // 建线段树
    S = 1
    while (S < nn) {
        S *= 2
    }
    let ts = 2 * S
    segVal = Array<Int32>(ts, { _ => 0 })
    segPos = Array<Int32>(ts, { _ => 0 })
    i = 0
    while (i < nn) {
        let L = i + 1
        let leaf = S + i
        if (ptr[L] >= 0) {
            segVal[leaf] = rs[Int64(ord[Int64(ptr[L])])]
        }
        segPos[leaf] = Int32(L)
        i += 1
    }
    v = S - 1
    while (v >= 1) {
        let lc = v << 1
        let rc = lc | 1
        if (segVal[lc] >= segVal[rc]) {
            segVal[v] = segVal[lc]
            segPos[v] = segPos[lc]
        } else {
            segVal[v] = segVal[rc]
            segPos[v] = segPos[rc]
        }
        v -= 1
    }

    // BFS：1 号不参加，连锁波及所有区间覆盖到不参加者的人
    var queue = Array<Int32>(nn + 1, { _ => 0 })
    var head: Int64 = 0
    var tail: Int64 = 1
    queue[0] = 1
    var badCnt: Int64 = 1
    while (head < tail) {
        let x = Int64(queue[head])
        head += 1
        while (true) {
            let (mv, mp) = queryMax(x)
            if (Int64(mv) < x) {
                break
            }
            // 成批删除左端点为 mp 且右端点不小于 x 的区间
            var idx = Int64(ptr[mp])
            while (true) {
                let oi = Int64(ord[idx])
                if (Int64(rs[oi]) < x) {
                    break
                }
                queue[tail] = Int32(oi + 2)
                tail += 1
                badCnt += 1
                idx += 1
                if (idx >= m || Int64(ls[Int64(ord[idx])]) != mp) {
                    break
                }
            }
            if (idx < m && Int64(ls[Int64(ord[idx])]) == mp) {
                ptr[mp] = Int32(idx)
                updatePos(mp, rs[Int64(ord[idx])])
            } else {
                ptr[mp] = -1
                updatePos(mp, 0)
            }
        }
        if (badCnt == nn) {
            break
        }
    }

    println(nn - badCnt)
    return 0
}
```
