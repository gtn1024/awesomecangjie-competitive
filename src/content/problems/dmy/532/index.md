---
oj: dmy
pid: '532'
title: '[R83C] 手套'
difficulty: 普及
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n,q \le 2\times 10^5$，$1 \le x \le n$，$t \in \{1,2\}$，$1 \le a \le 10^9$。

## 思路

**答案的拆分。** 同尺码的左手套只能和同尺码的右手套配对，不同尺码之间互不影响。设尺码 $x$ 的左手套有 $L_x$ 只、右手套有 $R_x$ 只，那么该尺码最多配出 $\min(L_x,R_x)$ 双，且各尺码的配对方案互不冲突，可以同时取到。因此

$$\text{答案}=\sum_{x=1}^{n}\min(L_x,R_x).$$

**增量维护。** 每次第一类或第二类操作都只改动一个尺码 $x$，因此不必重新求和。先记下改动前的 $L_x,R_x$，把 $\min(L_x,R_x)$ 从答案里减去；改动该尺码的库存后，再把新的 $\min$ 加回答案。第三类操作直接输出当前维护的总和，$O(1)$。

- 第一类操作：把对应一侧加上 $a$；
- 第二类操作：该侧变成 $\max(0,\text{库存}-a)$，即不足 $a$ 只时全部取出；
- 每次查询不需要改动库存。

**数值范围。** 单侧库存最多累加到 $2\times 10^5 \times 10^9 = 2\times 10^{14}$，答案同量级，需要用 64 位整数。

## 复杂度

每次操作 $O(1)$（输入解析按行长度），总时间 $O(n+q)$，空间 $O(n)$。

## 仓颉实现

操作行长度可能是 $4$（第一、二类）或 $1$（第三类），按切分后的元素个数分支处理即可。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = head[0]
    let q = head[1]
    let sz = n + 1
    let left = Array<Int64>(sz, { _ => 0 })
    let right = Array<Int64>(sz, { _ => 0 })
    var ans: Int64 = 0
    for (_ in 0..q) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        if (parts.size == 1) {
            println(ans)
        } else {
            let op = Int64.parse(parts[0])
            let x = Int64.parse(parts[1])
            let t = Int64.parse(parts[2])
            let a = Int64.parse(parts[3])
            let l0 = left[x]
            let r0 = right[x]
            if (l0 < r0) {
                ans -= l0
            } else {
                ans -= r0
            }
            if (op == 1) {
                if (t == 1) {
                    left[x] = l0 + a
                } else {
                    right[x] = r0 + a
                }
            } else {
                if (t == 1) {
                    if (l0 > a) {
                        left[x] = l0 - a
                    } else {
                        left[x] = 0
                    }
                } else {
                    if (r0 > a) {
                        right[x] = r0 - a
                    } else {
                        right[x] = 0
                    }
                }
            }
            let l1 = left[x]
            let r1 = right[x]
            if (l1 < r1) {
                ans += l1
            } else {
                ans += r1
            }
        }
    }
}
```

</details>
